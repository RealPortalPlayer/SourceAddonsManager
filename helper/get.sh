#!/bin/bash
NAME="output-$(date +%s%N | cut -b1-13)ms.log"
rm -f output-latest.log
ln -s "$NAME" output-latest.log
node ./.get "$@" | tee "$NAME"
