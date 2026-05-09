#!/bin/bash
NAME="check-$(date +%s%N | cut -b1-13)ms.log"
rm -f check-latest.log
ln -s "$NAME" check-latest.log
node ./.check "$@" | tee "$NAME"
