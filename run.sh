#!/bin/bash
node -v
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm 
./importer-script.sh &

sleep 10
./priority-start.sh &
#./single-start.sh &
#./bulk-start.sh
#./single-start.sh