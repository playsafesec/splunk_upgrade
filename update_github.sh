#!/bin/bash

# Simple GitHub update script
# Usage: ./update_github.sh "Your commit message"
#    or: ./update_github.sh (will prompt for message)

set -e

# Check if commit message is provided, otherwise prompt for it
if [ -z "$1" ]; then
    echo "💬 Enter commit message:"
    read -r COMMIT_MESSAGE
    
    # Check if message was entered
    if [ -z "$COMMIT_MESSAGE" ]; then
        echo "Error: Commit message cannot be empty"
        exit 1
    fi
else
    COMMIT_MESSAGE="$1"
fi

echo "📦 Adding changes..."
git add .

echo "💬 Committing changes..."
git commit -m "$COMMIT_MESSAGE"

echo "🚀 Pushing to GitHub..."
git push

echo "✅ Successfully updated GitHub repository!"
