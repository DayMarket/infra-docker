В этом контейнере установлен клиент VPN openconnect, SOCKS and port forwarding proxy ocproxy и nginx

Параметры подключения задаются в переменных окружения:

ENV VPN_SERVER='vpn.your-server.com'
ENV VPN_LOGIN='your.username'
ENV VPN_PASSWORD='YourPassword'

В случае определения переменной VPN_PROXY_SCRIPT включается port forwarding proxy в котором не требуются привелигированный режим запуска контейнера

В случае определения переменной VPN_PROXY_LOOP=true переподключение к впн серверу происходит в цикле внутри контейнера.

Описание параметров openconnect: https://www.infradead.org/openconnect/
Описание процесса запуска без root привелегий https://www.infradead.org/openconnect/nonroot.html
Используется https://github.com/cernekee/ocproxy и в качестве параметра в скрипт передается примерно это "./ocproxy -L 2222:unix-host:22 -L 3389:win-host:3389 -D 11080" 
(те в контенере на порту 2222 мапится порт хоста unix-host:22 находящегося за ВПН)

Для дополнительного проксирование установлен nginx, конфигурационный файл /etc/nginx/nginx.conf

При запуске контейнера не забыть открыть порты

Пример запуска в докере:

````
docker run -d -e VPN_SERVER=vpn.server.com -e VPN_LOGIN=user -e VPN_PASSWORD="password" -e VPN_PROXY_SCRIPT="ocproxy -L 9011:192.168.10.11:9100 -L 9012:192.168.10.12:9100 -D 11080" -v "/home/user/nginx.conf:/etc/nginx/nginx.conf:ro" -p 9011:9011 -p 9012:9012  --name fortivpn --restart always registry/fortivpnproxy
````
