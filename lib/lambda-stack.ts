import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import { Function, InlineCode, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class MyLambdaStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    stageName: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // const vpc = ec2.Vpc.fromLookup(this, "VPC", {
    //   vpcId: "vpc-067981a7410563005",
    // });

    // const bucket = s3.Bucket.fromBucketName(
    //   this,
    //   "ArtifactBucket",
    //   "linuxdna-dev-infra"
    // );
    // const s3Key = "lambda.zip";

    new NodejsFunction(this, "LambdaFunction", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, "lambda", "handler.ts"), // path to your Lambda function's entry file
      environment: {
        stageName: stageName,
        DATABASE_URL:
          "postgresql://postgres:y0urMasterPassword754!@database-1.c6cmqbgb5x9u.us-east-1.rds.amazonaws.com:5432/cognito?schema=public",
      },
      bundling: {
        nodeModules: ["@prisma/client", "prisma"],
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          beforeInstall(inputDir: string, outputDir: string): string[] {
            return [`cp -R ${inputDir}/prisma ${outputDir}/`];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [
              `cd ${outputDir}`,
              `yarn prisma generate --schema=./prisma/schema.prisma`, // Explicitly specify schema location
              `rm -rf node_modules/@prisma/engines`,
              `rm -rf node_modules/@prisma/client/node_modules node_modules/.bin node_modules/prisma`,
            ];
          },
        },
      },
      // vpc: vpc,
      // // Specify subnets and security groups if necessary
      // vpcSubnets: {
      //   // Adjust subnetType as necessary, e.g., PRIVATE, PUBLIC, or ISOLATED
      //   subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      // },
      // securityGroups: [
      //   // Reference or create a security group
      //   ec2.SecurityGroup.fromSecurityGroupId(
      //     this,
      //     "LambdaSG",
      //     "subnet-0afe8a904cf219749"
      //   ),
      // ],
    });
  }
}
