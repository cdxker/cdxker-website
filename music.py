from glob import glob
import os

def process_music_dir(dir):
    files = []
    dirs = []
    cover = None

    for file in glob(dir): 
        if file.endswith(".png"):
            cover = file
        elif os.path.isdir(file):
            directory = process_music_dir(file  + "/**")
            dirs.append(directory)
        else: 
            files.append(file)


    return {"files": files, "dirs": dirs, "cover": cover}

print(process_music_dir("/home/fastfist/Music/**"))


