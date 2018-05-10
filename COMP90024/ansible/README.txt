# COMP90024 Assignment 2
# Australian Social Media Analytics (City Melbourne)
# Team 41
# Jiajian Jiang 775535
# Yen Sheng Miao 849388
# Yijian Zhang 806676
# Yongkang Liu 849892
# Zonglin Jiang 862168


To deploy the remote virtual machine, simply change directory to which the same as setup.sh and using the following command

$ ./setup  

The bash file will start launching new instance and installing required packages automatically. 
Before running the bash file, make sure that openstack and ansible has been installed correctly.

There are several files in the deployment folders:
- ansible.cfg: ignore ansible ssh authenticity checking.
- cloud.key: the private key used for connecting to the system.
- conf.sh: authentication script of user information to connect to nectar.
- hosts: a list of remote hosts.
- playbook.yml: install required packages in the remote hosts.
- roles folder: contains specific installation information of required software.
- setup.sh: run the launching and deploying process.
