#!/bin/bash
# check-port.sh - ポートの使用状況を確認し、必要に応じてプロセスを終了するスクリプト

PORT=$1
echo "ポート ${PORT} の使用状況を確認中..."

# ポートを使用しているプロセスを確認
PID=$(lsof -t -i:${PORT})

if [ -z "$PID" ]; then
  echo "ポート ${PORT} は利用可能です"
  exit 0
else
  echo "警告: ポート ${PORT} は既にプロセス ${PID} によって使用されています"
  
  # プロセス名を取得
  PROCESS_NAME=$(ps -p $PID -o comm=)
  echo "使用中のプロセス: $PROCESS_NAME (PID: $PID)"

  if [ "$2" == "--kill" ]; then
    echo "プロセスを終了しています..."
    kill -9 $PID
    echo "プロセス $PID を終了しました。ポート ${PORT} が利用可能になりました"
    exit 0
  else
    echo "プロセスを終了するには: scripts/check-port.sh ${PORT} --kill"
    exit 1
  fi
fi
