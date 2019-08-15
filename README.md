
# Gazette - Publisher

## Description

A serverless application for publishing CloudFormation templates to service catalog.

## Requirements

- Templates must be published to a bucket in the following format <product-name>/<product-version.(yml|yaml|json)>.
- Any source code required by templates (e.g. lambda function source) must be stored in a separate bucket.
- A CloudTrail must be configured to record write events that are made to the template bucket.

`setup.yaml` is provided at the project root to set up a trail and two associated buckets.

## Optional

A non-default EventBridge may be specified to send domain events to. The only domain event that is emitted follows the form;

```
{
    "version": "0",
    "id": "2c974e32-d256-cae1-5187-64bb9ff7b2c1",
    "detail-type": "publisher.Created",
    "source": "gazette",
    "account":"<account-arn>",
    "time":"2019-08-15T02:50:23Z",
    "region":"ap-southeast-2",
    "resources":[ "arn:aws:s3:::<template-bucket>" ],
    "detail": {
        "productId": "<product-id>",
        "name": "<product-name>",
        "version": "<product-version>"
    }
}
```

## Build, Test, Deploy

- Run `npm run build` to build the project. This will create the `.aws-sam` directory.

- Tests can be run via `npm run test -- --cover`.

To deploy, change in to the `.aws-sam/build` directory and run the following script with the appropriate values substituted.

NB: Remember that the `TEMPLATE_BUCKET` must have a trail enabled this logging write events to the bucket.

```bash
ARTIFACT_BUCKET=
STACK_NAME=
TEMPLATE_BUCKET=
EVENT_BUS=

sam package --template-file template.yaml --s3-bucket $ARTIFACT_BUCKET \
    --output-template-file packaged.yaml

sam deploy --template-file packaged.yaml --stack-name $STACK_NAME \
    --capabilities CAPABILITY_IAM --parameter-overrides \
    Bucket=$TEMPLATE_BUCKET Owner=$OWNER EventBus=$EVENT_BUS
```

## Todo

- Not all failure modes are currently tested
- Lambda's require 'right-sizing' via [power-tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning)
- No E2E tests
- CI/CD and publishing to SAR needs setting up
- Product/Versions are not removed when deleted from bucket
