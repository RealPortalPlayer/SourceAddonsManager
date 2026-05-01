// Purpose: Small string manipulation functions
// Created on: 5/1/26 @ 2:39 AM

module.exports.removeNewlineEnd = text => text.endsWith("\n") ? text.substring(0, text.length - 1) : text
