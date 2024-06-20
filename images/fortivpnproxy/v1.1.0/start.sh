#!/bin/bash

echo Start nginx
nginx

echo Run vpn

if [[ -z "${VPN_PROXY_SCRIPT}" ]] ; then


    while true
        do
            echo "Start vpn without proxy"
            echo $VPN_PASSWORD |openconnect -u $VPN_LOGIN $VPN_SERVER --protocol=fortinet --passwd-on-stdin;
            if [[  $VPN_PROXY_LOOP = "true" ]] ; then echo "Reconnect" ; else break ; fi
        done
else 
    while true
        do
            echo "Start vpn with proxy"
            echo $VPN_PASSWORD |openconnect -u $VPN_LOGIN $VPN_SERVER --protocol=fortinet --script-tun --script "$VPN_PROXY_SCRIPT"  --passwd-on-stdin;
            if [[  $VPN_PROXY_LOOP = "true" ]] ; then echo "Reconnect" ; else break ; fi
        done
fi

exit 1
