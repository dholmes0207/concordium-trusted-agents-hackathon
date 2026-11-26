#!/bin/sh
export PATH="$HOME/.local/bin:$PATH"
kind delete cluster --name mandate-gate
