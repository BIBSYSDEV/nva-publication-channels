nva-publication-channels
A thin client to wrap NSD DBH's publication channel databases.

Swagger UI

Structure

To build and deploy your application for the first time, run the following in your shell:

sam build
sam deploy --guided
The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

Stack Name : The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name.

AWS Region : The AWS region you want to deploy your app to.

Confirm changes before deploy : If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.

Allow SAM CLI IAM role creation : Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modifies IAM roles, the CAPABILITY_IAM value for capabilities must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass --capabilities CAPABILITY_IAM to the sam deploy command.

Save arguments to samconfig.toml : If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run sam deploy without parameters to deploy changes to your application.

You can find your API Gateway Endpoint URL in the output values displayed after deployment.

Use the SAM CLI to build and test locally
Build your application with the sam build command.

nva-publication-channels$ sam build
The SAM CLI installs dependencies defined in src/package.json, creates a deployment package, and saves it in the .aws-sam/build folder.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the events folder in this project.

Run functions locally and invoke them with the sam local invoke command.

nva-publication-channels$ sam local invoke JournalFunction --event events/event.json
The SAM CLI can also emulate your application's API. Use the sam local start-api to run the API locally on port 3000.

nva-publication-channels$ sam local start-api
nva-publication-channels$ curl http://localhost:3000/
The SAM CLI reads the application template to determine the API's routes and the functions that they invoke. The Events property on each function's definition includes the route and method for each path.

      Events:
        GetJournalEvent:
          Type: Api
          Properties:
            Path: /journal
            Method: get
        GetPublisherEvent:
          Type: Api
          Properties:
            Path: /publisher
            Method: get
Add a resource to your application
The application template uses AWS Serverless Application Model (AWS SAM) to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources such as functions, triggers, and APIs. For resources not included in the SAM specification, you can use standard AWS CloudFormation resource types.

Fetch, tail, and filter Lambda function logs
To simplify troubleshooting, SAM CLI has a command called sam logs. sam logs lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

NOTE: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.

nva-publication-channels$ sam logs -n JournalFunction --stack-name nva-publication-channels --tail
You can find more information and examples about filtering Lambda function logs in the SAM CLI Documentation .

Tests
Tests are defined in the tests folder in this project. Use NPM to install the Mocha test framework and run tests.

nva-publication-channels$ cd src
src$ npm install
# Unit test
src$ npm run test
# Integration test, requiring deploying the stack first.
# Create the env variable AWS_SAM_STACK_NAME with the name of the stack we are testing
src$ AWS_SAM_STACK_NAME=<stack-name> npm run integ-test
