#!/bin/bash

#launch the new distance on nectar and install required packages
echo "Enter the name of new instance:"
read newInsName 

echo "Give the path of host file."
read hosts_path

echo "Give the path of key file."
read KeyPath

echo $newInsName
echo $hosts_path
echo $KeyPath
#config openstack file and defines the servers information 
. conf.sh 

#create a new instance from iso image 
IP_ADDR=`openstack server create --flavor 'm2.medium' --image '18bba5e4-d266-4209-9dde-2336465f0384' \
    --key-name 'id_zhang' --security-group 'default' --availability-zone 'melbourne-qh2' \
    --wait --column 'accessIPv4' $newInsName | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}'`

echo $IP_ADDR


#create a volume for the new instace
openstack volume create --availability-zone 'melbourne-qh2' --size 62 $newInsName

#add the new volume to this new instance
openstack server add volume $newInsName $newInsName --device /dev/vda

#list the volume
openstack volume list


echo "before sleep"
# wait for initialization
sleep 30s
echo "after sleep"

#create host file based on role
filecontent="[remote]"
echo $filecontent > hosts

filecontent=$IP_ADDR" ansible_connection=ssh ansible_ssh_extra_args='-o StrictHostKeyChecking=no' ansible_user=ubuntu ansible_ssh_private_key_file="$KeyPath
echo $filecontent >> hosts

#start deploy remote host
echo "start deployment for a harverstserver"
ANSIBLE_NO_LOG=False ansible-playbook -i $hosts_path -u ubuntu --key-file=$KeyPath playbook.yml