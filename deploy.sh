# echo in violet
echo -e '\e[1;35m'

echo -e '\e[0m'

# check if docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  echo 'Installing Docker' >&2
  sudo apt-get update
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  sudo usermod -aG docker $USER
  sudo apt-get install docker-compose-plugin
    echo -e '\e[1;33m Please restart your terminal and run the script again \e[0m'
    exit 1
fi

echo -e '\e[1;32m Starting server \e[0m'

cd nginx
echo -e '\e[1;32m Building docker image for nginx \e[0m'
docker build -t express-nginx .
if [ $? -ne 0 ]; then
    echo -e '\e[1;31m Error: docker build failed for nginx \e[0m'
    exit 1
fi

cd ../app
docker build -t express-app .
if [ $? -ne 0 ]; then
    echo -e '\e[1;31m Error: docker build failed for app \e[0m'
    exit 1
fi

echo -e '\e[1;32m Getting containers up \e[0m'

docker compose up -d
if [ $? -ne 0 ]; then
    echo -e '\e[1;31m Error: docker compose up failed \e[0m'
    exit 1
fi

echo -e '\e[1;32m Server started \e[0m'
exit 0

