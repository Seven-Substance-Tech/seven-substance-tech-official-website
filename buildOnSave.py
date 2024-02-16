import os
from socketserver import BaseServer
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

class FileEventHandler(FileSystemEventHandler):

    def __init__(self) -> None:
        FileSystemEventHandler.__init__(self)
    
    def on_created(self, event) -> None:
        if not event.is_directory:
            src: str = event.src_path
            for dirname in ["interface", "style", "script", "res", "library"]:
                if dirname in src:
                    print(f"检测到文件 {src} 创建，自动执行构建")
                    os.system("python build.py")
                    break
    
    def on_moved(self, event) -> None:
        if not event.is_directory:
            src: str = event.src_path
            dst: str = event.dest_path
            for dirname in ["interface", "style", "script", "res", "library"]:
                if dirname in src:
                    print(f"检测到文件 {dst} 移动，自动执行构建")
                    os.system("python build.py")
                    break

    def on_modified(self, event) -> None:
        if not event.is_directory:
            src: str = event.src_path
            for dirname in ["interface", "library"]:
                if dirname in src:
                    print(f"检测到文件 {src} 保存，自动执行构建")
                    os.system("python build.py")
                    break

def start() -> None:
    dir: str = os.path.dirname(os.path.abspath(__file__))
    observer: BaseServer = Observer()
    event_handler = FileEventHandler()
    observer.schedule(event_handler, dir, True)
    observer.start()
    print(f"服务已启动，监听文件夹：{dir}")
    try:
        input()
    except KeyboardInterrupt:
        observer.stop()
        observer.join()
        
if __name__ == "__main__":
    start()