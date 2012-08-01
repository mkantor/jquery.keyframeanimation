#!/bin/sh

# This script generates documentation by pulling out comments from the source 
# code. It requires docco and some common shell utilities. I find it works 
# well in a pre-commit hook.


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



# Generate the README
# ------------------------------------------------------------------------------

# The README text comes from the header comments at the top of the source file.

# The header is delimited by 70 dashes (or more).
DELIMITER='----------------------------------------------------------------------'

# Grab the comments which will become the README.
END_OF_HEADER=`grep --regexp="$DELIMITER" --line-number --max-count=1 "$SOURCE_FILE" | cut --delimiter=: --fields=1`
COMMENTS=`head -n $(($END_OF_HEADER-1)) "$SOURCE_FILE"`

# Strip out all instances of "// " from the beginning of lines.
README_BODY=`echo "$COMMENTS" | sed 's/^\/\/ //'`

if [ -n "$README_BODY" ]
then
	# The README title is the source file's name without its extension.
	TITLE=`echo "$SOURCE_FILE" | sed 's/\(.*\)\..*$/\1/'`
	UNDERLINE=`echo "$TITLE" | sed 's/./=/g'`
	
	# Generate the full README and save it.
	printf '%s\n%s\n\n%s\n' "$TITLE" "$UNDERLINE" "$README_BODY" > "$README_FILE" && echo "Saved README in $README_FILE."
else
	echo "No README text was found."
fi
