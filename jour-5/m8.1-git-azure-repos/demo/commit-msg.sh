#!/bin/sh
# Hook commit-msg : impose la convention type(portée): description
MSG=$(head -n1 "$1")
if ! echo "$MSG" | grep -Eq '^(feat|fix|test|refactor|chore|docs|ci|perf|style)(\([a-z0-9._-]+\))?!?: .{1,72}$'; then
  echo "Message de commit non conforme : '$MSG'"
  echo "Attendu : type(portée): description   ex. test(virement): ajoute le cas plafond"
  exit 1
fi
