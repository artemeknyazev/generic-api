#! /usr/bin/env bash

# Constants for certificate generation

readonly REQUEST_SUBJECT="/C=RU/ST=Moscow/L=Moscow/O=Generic_API_Inc/OU=IT_Department/CN=localhost"
readonly PRIVATE_KEY_FILE=.my-private.key
readonly PUBLIC_KEY_FILE=.my-public.key
readonly REQUEST_FILE=.my-request.csr
readonly CERTIFICATE_FILE=.my-certificate.crt
readonly PASS_FILE=.my-pass.pass
readonly FILE_LIST=($PRIVATE_KEY_FILE $PUBLIC_KEY_FILE $REQUEST_FILE $CERTIFICATE_FILE $PASS_FILE)
