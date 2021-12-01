import os


filenames=os.listdir("uv_value_2021")
# print(filenames)
# file=filenames[0]
i=0
for file in filenames:
    i=i+1
    print(file,i,"/8785")
    print(int(file.split(".")[0].split("t_")[1])-31622400)
    new_file=file.split(".")[0].split("t_")[0]+"t_"+str(int(file.split(".")[0].split("t_")[1])-31622400)+".json"
    with open("uv_value_2021\\"+file,"r") as f:    #设置文件对象
        s = f.read()    #可以是随便对文件的操作
        s=s.replace("\"time\": \"2021-","\"time\": \"2020-")
        # print(str)
        with open("uv_value\\"+new_file,"w+") as f1:
            f1.write(s)