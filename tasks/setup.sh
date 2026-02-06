# Choose projet name
echo Nom du projet :
read name;
echo ""

# Choose package manager
echo Package manager :
echo [n] npm
echo [v] nvm
echo [p] pnpm

read -n 1 k <&1
echo ""
echo ""

# Rename workspace
mv project-name.code-workspace $name.code-workspace
mv www/wp-content/themes/project-name.md www/wp-content/themes/$name.md

# Copy htaccess
cp www/.htaccess.dev www/.htaccess
cp www/wp-content/themes/front/.env.dev www/wp-content/themes/front/.env

# Set env.dev projet name
printf "\nNAME=$name" >> www/wp-content/themes/front/.env

# Install packages

if [ "$k" = "n" ]; then
   npm i
fi

if [ "$k" = "v" ]; then
   nvm use
   npm i
fi

if [ "$k" = "p" ]; then
   pnpm i
fi

cd www/wp-content/themes/front

if [ "$k" = "n" ]; then
   npm i
fi

if [ "$k" = "v" ]; then
   nvm use
   npm i
fi

if [ "$k" = "p" ]; then
   pnpm i
fi

