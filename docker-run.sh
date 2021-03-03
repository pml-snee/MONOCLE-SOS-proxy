#!/bin/bash
#
# this script is the ENTRYPOINT for the docker container; it startes the
# sos proxy with the correct version of node

cd /app/sos_proxy


node bin/www