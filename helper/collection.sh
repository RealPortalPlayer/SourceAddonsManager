#!/bin/bash
NAME="collection-$(date +%s%N | cut -b1-13)ms.log"
rm -f collection-latest.log
ln -s "$NAME" collection-latest.log
node ./.collection "$@" | tee "$NAME"
