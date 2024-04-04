import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  Step,
} from "aws-cdk-lib/pipelines";
import { ManualApprovalStep } from "aws-cdk-lib/pipelines";
import * as iam from "aws-cdk-lib/aws-iam";
import { TesCorePipelineAppStage } from "./stage";
import { Repository } from "aws-cdk-lib/aws-codecommit";

export class TestcoreCdkCrossAcctStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repo = Repository.fromRepositoryName(
      this,
      "Repository",
      "testcore-cdk-cross-acct"
    );

    // Define a custom IAM role with the required permissions for the CodeBuild project
    const customRole = new iam.Role(this, "CustomCodeBuildRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      // Example managed policy; adjust according to least privilege principle
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"), // For demonstration; in production, adhere to least privilege
      ],
    });

    const pipeline = new CodePipeline(this, "Pipeline", {
      crossAccountKeys: true,
      pipelineName: "TestPipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.codeCommit(repo, "main"),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    const testingStage = pipeline.addStage(
      new TesCorePipelineAppStage(this, "test", {
        env: { account: "037056210623", region: "us-gov-east-1" },
      })
    );

    testingStage.addPre(
      new ShellStep("Run Unit Tests", { commands: ["npm install", "npm test"] })
    );

    testingStage.addPost(new ManualApprovalStep("Manual approval before QA"));

    const prodStage = pipeline.addStage(
      new TesCorePipelineAppStage(this, "qa", {
        env: { account: "037056210623", region: "us-east-1" },
      })
    );
  }
}
