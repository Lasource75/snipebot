Snipebot vous permet de sniper vos token favoris et bien plus !  

Pre-requis:  

npm -g i eslint-cli  

Pour le fichier d'env merci de vous referer à la structure suivante :  

PRIVATE_KEY="Votre clef privée MetaMask ou trust wallet ou que sais-je encore ?"  
PUBLIC_KEY="Votre clef public (celle qui est visible lorsque vous effectuez des transactions"  

INPUT_TOKEN="L'adresse du token avec lequel vous voulez acheter ou snipe (attention si aucune pool de liquidité n'existe ça ne fonctionnera pas)"  
TOKEN_TO_SNIPE="le token que vous voulez snipe"  

AMOUNT="Le montant en INPUT_TOKEN ex : 5 avax OU 5 usdc, ce n'est pas la même chose :D"  
SLIPPAGE="Le slippage, ne fonctionne pas encore."  

API_KEY="Votre clef API, dépend de l'explorer sur lequel vous êtes"  

PROD="Si prod = FALSE vos transactions se dérouleront sur le main net et si à TRUE sur le test net"  

LISTEN_CONTRACT_ADDRESS="Ici vous pourrez lire les événement d'un smart contract, mettez simplement son adresse"  

DEX="Le dex, pas encore au point."  

BC_URL="Votre endpoint en wss (absolument en wss)"  
TESTNET="Votre endpoint en wss mais cette fois ci pour le testnet"
