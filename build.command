#!/bin/sh
here="`dirname \"$0\"`"

cd "$here" || exit 1

java -jar builder/JSBuilder2.jar -v -p builder/Ext.ux.StoreView.jsb2 -d .

jsduck Ext.ux.StoreView.js --output docs --ignore-global --title "Ext.ux.StoreView Documentation" --footer "Generated with JSDuck"

