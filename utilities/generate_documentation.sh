#!/bin/sh

# This script generates documentation by pulling out comments from the source 
# code. It requires docco and some common shell utilities. I find it works 
# well in a pre-commit hook.

# FIXME: It'd be nice if this could operate on staged file contents when 
# running as a pre-commit hook (right now it operates on the WC file contents, 
# which may differ).



# This script accepts exactly one argument: the file to use as the 
# documentation source.
if [ $# -ne 1 ]
then
	echo 1>&2 "$0: One argument (the source file) must be specified."
	exit 2
elif [ ! -f $1 ]
then
	echo 1>&2 "$0: $1: No such file."
	exit 2
fi

SOURCE_FILE=$1
README_FILE=README.md



# Generate docs/*
# ------------------------------------------------------------------------------
docco "$SOURCE_FILE"



# Generate the README from the comment header in the source code
# ------------------------------------------------------------------------------

# The header is delimited by 70 dashes (or more).
DELIMITER='----------------------------------------------------------------------'

# Grab the header comments from the source file.
END_OF_HEADER=`grep --regexp="$DELIMITER" --line-number --max-count=1 "$SOURCE_FILE" | cut --delimiter=: --fields=1`
RAW_HEADER=`head -n $(($END_OF_HEADER-1)) "$SOURCE_FILE"`

# Strip out all instances of "// " from the beginning of lines.
README=`echo "$RAW_HEADER" | sed 's/^\/\/ //'`

if [ -n "$README" ]
then
	echo "$README" > "$README_FILE" && echo "Saved README in $README_FILE."
else
	echo "No README text was found."
fi
