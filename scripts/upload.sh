#!/usr/bin/env sh

# Load environment variables from .env file
if [ -f .env ]; then
    . .env
else
    echo ".env file not found!"
    exit 1
fi

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null
then
    echo "sshpass could not be found, please install it. (brew install sshpass)"
    exit 1
fi


sshpass -p "$SSH_PASSWORD" rsync -av --delete --exclude audio_db --exclude test dist/* $SSH_USER@$SSH_HOST:$SSH_DEST
#sshpass -p "$(SSH_PASSWORD)" rsync -av --delete --exclude audio_db $(dist)/ $(SSH_USER)@$(SSH_HOST):$(SSH_DEST)

if [ $? -eq 0 ]; then
    echo "Directory copied successfully!"
else
    echo "Error occurred during copying!"
    exit 1
fi
