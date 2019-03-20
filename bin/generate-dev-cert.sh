#! /usr/bin/env bash

PASSPHRASE=
readonly PRIVATE_KEY_FILE=.my-private.key
readonly PUBLIC_KEY_FILE=.my-public.key
readonly REQUEST_FILE=.my-request.csr
readonly CERTIFICATE_FILE=.my-certificate.crt
readonly PASS_FILE=.my-pass.pass
readonly REQUEST_SUBJECT="/C=RU/ST=Moscow/L=Moscow/O=Generic_API_Inc/OU=IT_Department/CN=localhost"

usage() {
    echo "Usage: $0 (pass:<passphrase>|file:<path/to/passphrase/file>)"
}

create_pass_file_if_required() {
  if [[ $PASSPHRASE = "pass:"* ]]; then
    echo -n ${PASSPHRASE#"pass:"} > $PASS_FILE
  fi
  true
}

create_private_key() {
    openssl genrsa -aes128 \
        -out $PRIVATE_KEY_FILE \
        -passout $PASSPHRASE \
        2048
}

create_public_key() {
    openssl rsa -pubout \
        -in $PRIVATE_KEY_FILE \
        -passin $PASSPHRASE \
        -out $PUBLIC_KEY_FILE
}

create_request() {
    openssl req -new \
        -key $PRIVATE_KEY_FILE \
        -passin $PASSPHRASE \
        -out $REQUEST_FILE \
        -subj $REQUEST_SUBJECT
}

create_certificate() {
    openssl x509 -req \
        -days 1 \
        -in $REQUEST_FILE \
        -signkey $PRIVATE_KEY_FILE \
        -passin $PASSPHRASE \
        -out $CERTIFICATE_FILE
}

move_previous() {
    mv $PRIVATE_KEY_FILE $PRIVATE_KEY_FILE.bak; \
    mv $PUBLIC_KEY_FILE $PUBLIC_KEY_FILE.bak; \
    mv $REQUEST_FILE $REQUEST_FILE.bak; \
    mv $CERTIFICATE_FILE $CERTIFICATE_FILE.bak
}

move_previous_back() {
    mv $PRIVATE_KEY_FILE.bak $PRIVATE_KEY_FILE; \
    mv $PUBLIC_KEY_FILE.bak $PUBLIC_KEY_FILE; \
    mv $REQUEST_FILE.bak $REQUEST_FILE; \
    mv $CERTIFICATE_FILE.bak $CERTIFICATE_FILE
}

remove_previous() {
    rm $PRIVATE_KEY_FILE.bak $PUBLIC_KEY_FILE.bak $REQUEST_FILE.bak $CERTIFICATE_FILE.bak
}

main() {
    move_previous &>/dev/null
    ( \
        create_pass_file_if_required && \
        create_private_key && \
        create_public_key && \
        create_request && \
        create_certificate \
    ) &>/dev/null
    if [ "$?" != "0" ]; then
        move_previous_back &>/dev/null
        (>&2 echo "Something went wrong")
        exit 1
    else
        remove_previous &>/dev/null
    fi
    exit 0
}

if [ "$1" != "" ]; then
    PASSPHRASE=$1
else
    usage
    exit 1
fi

main
