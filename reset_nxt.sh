#!/bin/bash
echo "🔄 Resetting NXT Bluetooth connection..."
blueutil --disconnect 00-16-53-05-b0-81
blueutil --unpair 00-16-53-05-b0-81
read -p "Press ENTER to continue, then we pair with NXT (enter PIN: 1234)"
blueutil --pair 00-16-53-05-b0-81
echo "✅ Done! Wait 5 seconds, then start bridge."