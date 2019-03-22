#! /usr/bin/env bash

# Generates an SLL/TLS certificate for development

# Source common constants
source $(dirname $0)/cert-consts.sh

readonly SCRIPT_NAME=$(basename $0)
PASSPHRASE=

usage() {
    echo "Usage:"
    echo "    $SCRIPT_NAME [<passphrase>]"
    echo "        Generate certificate with a provided passphrase"
    echo "        If a passphrase is not provided, generates one"
    echo "    $SCRIPT_NAME -h | --help"
    echo "        This help"
    echo ""
}

# Accepts CLI args as parameters
# Sets variables before running the script or prints usage
process_args() {
    echo "$1"
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        usage
        exit 1
    elif [ "$1" != "" ]; then
        # Note: openssl requires 'pass:' prefix for the passphrase
        PASSPHRASE=pass:$1
    else
        PASSPHRASE=pass:$(openssl rand -base64 32)
    fi
}

# Create the file containing the provided passphrase
# Note: required for instantiating HTTPS server
create_pass_file() {
    echo -n ${PASSPHRASE#"pass:"} > $PASS_FILE
}

# Create the file containing the private key encrypted with the passphrase
# Note: required for instantiating HTTPS server
create_private_key() {
    openssl genrsa -aes128 \
        -out $PRIVATE_KEY_FILE \
        -passout $PASSPHRASE \
        2048
}

# Create the file containing the public key from the created private key
create_public_key() {
    openssl rsa -pubout \
        -in $PRIVATE_KEY_FILE \
        -passin $PASSPHRASE \
        -out $PUBLIC_KEY_FILE
}

# Create certificate request file from the created private for provided subject
create_request() {
    openssl req -new \
        -key $PRIVATE_KEY_FILE \
        -passin $PASSPHRASE \
        -out $REQUEST_FILE \
        -subj $REQUEST_SUBJECT
}

# Create certificate from the certificate request and sign it with the private key
# Note: required for instantiating HTTPS server
create_certificate() {
    # Note: '-days 1' creates a short-lived certificate
    openssl x509 -req \
        -days 1 \
        -in $REQUEST_FILE \
        -signkey $PRIVATE_KEY_FILE \
        -passin $PASSPHRASE \
        -out $CERTIFICATE_FILE
}

# Moves previous certificate-related files to a backup location
move_previous() {
    for filename in "${FILE_LIST[@]}"
    do
        mv $filename $filename.bak
    done
}

# Returns previous certificate-related files from a backup location
move_previous_back() {
    for filename in "${FILE_LIST[@]}"
    do
        mv $filename.bak $filename
    done
}

# Removes previous certificate-related files
remove_previous() {
    for filename in "${FILE_LIST[@]}"
    do
        rm $filename.bak
    done
}

main() {
    # Backup previous files
    move_previous &>/dev/null
    # Create new files
    ( \
        create_pass_file && \
        create_private_key && \
        create_public_key && \
        create_request && \
        create_certificate \
    ) &>/dev/null
    if [ "$?" != "0" ]; then
        # Restore backup and exit
        move_previous_back &>/dev/null
        (>&2 echo "Something went wrong")
        exit 1
    else
        # Previous files no longer needed
        remove_previous &>/dev/null
    fi
    exit 0
}

process_args $1
main
