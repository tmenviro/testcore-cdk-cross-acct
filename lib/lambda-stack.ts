import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Function, InlineCode, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
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

    new Function(this, "LambdaFunction", {
      runtime: Runtime.NODEJS_18_X,
      //handler: "testLambda::testLambda.Bootstrap::ExecuteFunction",
      handler: "testLambda.handler",
      // code: Code.fromBucket(bucket, s3Key),
      code: Code.fromAsset(path.join(__dirname, "lambda")), //resolving to ./lambda directory
      environment: { stageName: stageName }, //inputting stagename
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
