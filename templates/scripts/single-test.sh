#!/bin/bash

TEST_FILE_NAME="$2"

TEST_ARG=""
if [ "$1" == "--debug" ]; then
  TEST_ARG="debug"
  echo "Running tests in debug mode..."
elif [ "$1" == "--watch" ]; then
  TEST_ARG="--watch"
  echo "Running tests in watch mode..."
else
  # No test argument passed, argument one is the filename
  TEST_FILE_NAME="$1"
fi

FILES=$(find . -name $TEST_FILE_NAME -not -path '*/node_modules/*')
echo Finding tests matching \'$TEST_FILE_NAME\'...
echo ""
echo "NODE_PATH=./src NODE_ENV='test' mocha $TEST_ARG $FILES --opts .mocha.opts;"
NODE_PATH=./src NODE_ENV='test' mocha $TEST_ARG $FILES --opts .mocha.opts;
