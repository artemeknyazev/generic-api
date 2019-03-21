#! /usr/bin/env bash

# Trust a development SSL/TLS certificate

# Source common constants
source $(dirname $0)/cert-consts.sh

sudo security add-trusted-cert \
    -d \
    -r trustRoot \
    -p ssl \
    -s 'localhost' \
    -k ~/Library/Keychains/login.keychain \
    $CERTIFICATE_FILE
