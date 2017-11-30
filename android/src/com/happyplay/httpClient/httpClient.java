package com.happyplay.httpClient;

import android.os.Environment;
import android.util.Log;

import org.cocos2dx.javascript.AppActivity;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

/**
 * Created by Fanjiahe on 2016/4/26.
 */
public class httpClient {

    private String srcPath = "/sdcard/mp3/FmChannels.txt";
    private String actionUrl = "http://127.0.0.1:3000";
    private String path = "pipi";
    private OutputStream output = null;
    public int ok = 1;
    public String filePath;
    public httpClient(String filePath, String url) {
        srcPath = filePath;
        actionUrl = url;
    }

    public  httpClient(final String filePath, final  String fileName,final String url)
    {
        path = filePath;
        srcPath = fileName;
        actionUrl = url;
    }

    /* 上传文件至Server的方法 */
    public void uploadFile() {

        filePath = srcPath;
        String uploadUrl = actionUrl;
        String end = "\r\n";
        String twoHyphens = "--";
        String boundary = "******";
        try {
            URL url = new URL(uploadUrl);
            HttpURLConnection httpURLConnection = (HttpURLConnection) url
                    .openConnection();
            httpURLConnection.setDoInput(true);
            httpURLConnection.setDoOutput(true);
            httpURLConnection.setUseCaches(false);
            httpURLConnection.setRequestMethod("POST");
            httpURLConnection.setRequestProperty("Connection", "Keep-Alive");
            httpURLConnection.setRequestProperty("Charset", "UTF-8");
            httpURLConnection.setRequestProperty("Content-Type",
                    "multipart/form-data;boundary=" + boundary);

            DataOutputStream dos = new DataOutputStream(httpURLConnection.getOutputStream());
            dos.writeBytes(twoHyphens + boundary + end);
            dos.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\""
                    + srcPath.substring(srcPath.lastIndexOf("/") + 1)
                    + "\"" + end);
            dos.writeBytes(end);
            //将SD 文件通过输入流读到Java代码中-++++++++++++++++++++++++++++++`````````````````````````
            FileInputStream fis = new FileInputStream(srcPath);
            byte[] buffer = new byte[1024 * 1024]; // 1024k
            int count = 0;
            while ((count = fis.read(buffer)) != -1) {
                dos.write(buffer, 0, count);

            }
            fis.close();
            System.out.println("file send to server............");
            dos.writeBytes(end);
            dos.writeBytes(twoHyphens + boundary + twoHyphens + end);
            dos.flush();

            //读取服务器返回结果
            InputStream is = httpURLConnection.getInputStream();
            InputStreamReader isr = new InputStreamReader(is, "utf-8");
            BufferedReader br = new BufferedReader(isr);
            String result = br.readLine();
            Log.i("result", result);
            dos.close();
            is.close();

        } catch (Exception e) {
            e.printStackTrace();
            ok = 0;
        }
    }

    public void downLoadFile() {
        try {
            URL url = new URL(actionUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
//            String SDCard = Environment.getExternalStorageDirectory() + "";
//            String pathName = SDCard + "/" + path + "/" + srcPath;//文件存储路径
            String pathName =  path + srcPath;//文件存储路径
            filePath = pathName;
            File file = new File(pathName);
            InputStream input = conn.getInputStream();
            if (file.exists()) {
                System.out.println("exits");
                file.delete();
            }

//            String dir = SDCard + "/" + path;
            String dir =  path;
            new File(dir).mkdir();//新建文件夹
            file.createNewFile();//新建文件
            output = new FileOutputStream(file);
            //读取大文件
            byte[] buffer = new byte[1024 * 1024];
            int len = 0;
            while ((len = input.read(buffer)) != -1) {
                output.write(buffer, 0, len);
            }
            input.close();
            output.flush();
            Log.i("dirdddd", dir + "||" + pathName);
        } catch (MalformedURLException e) {
            e.printStackTrace();
            ok = 0;
        } catch (IOException e) {
            e.printStackTrace();
            ok = 0;
        } 
    }
}
