
# Datum: siehe https://www.cyberciti.biz/faq/linux-unix-formatting-dates-for-display/
NOW=$(date +"_%Y-%d-%m_%H-%M-%S")
tar -cf archiv-site/site$NOW.tar _site
jekyll build --trace
push-target.sh
