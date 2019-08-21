#!/bin/bash

set -e

# Respect AWS_DEFAULT_REGION if specified
[ -n "$AWS_DEFAULT_REGION" ] || export AWS_DEFAULT_REGION=us-east-1

# Respect AWS_DEFAULT_OUTPUT if specified
[ -n "$AWS_DEFAULT_OUTPUT" ] || export AWS_DEFAULT_OUTPUT=json

VERSION=$(git name-rev --tags --name-only $(git rev-parse HEAD))

ARGS=()

ARGS+=( "--template $INPUT_TEMPLATE" )
ARGS+=( "--semantic-version $INPUT_SEMANTIC_VERSION" )

CMD="sam publish ${ARGS[@]}"

output=$( sh -c "$CMD" )

# Preserve output for consumption by downstream actions
echo "$output" > "${HOME}/${GITHUB_ACTION}.${AWS_DEFAULT_OUTPUT}"

# Write output to STDOUT
echo "$output"