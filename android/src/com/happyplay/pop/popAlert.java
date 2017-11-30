package  com.happyplay.pop;

import android.app.Activity;
import android.app.AlertDialog;
import android.widget.Toast;

/**
 * Created by FanJiaHe on 2015/11/18.
 */
public class popAlert
{
    /**
     * 弹出对话框
     * @param title String 标题
     * @param message String 内容
     * @param app Activity
     * */
    public static void showAlertDialog(final String title,final String message, final Activity app)
    {
        //这里一定要使用runOnUiThread
        app.runOnUiThread(new Runnable()
        {
            @Override
            public void run()
            {
                AlertDialog alertDialog = new AlertDialog.Builder(app).create();
                alertDialog.setTitle(title);
                alertDialog.setMessage(message);
                alertDialog.setIcon(android.R.drawable.sym_def_app_icon);
                alertDialog.show();
            }
        });
    }

    /**
     * 弹出一个toast
     * @param tip String 提示语
     * @param app Activity
     * */
    public static void showToast(final String tip, final Activity app)
    {
        app.runOnUiThread(new Runnable()
        {
            @Override
            public void run()
            {
                Toast.makeText(app.getApplicationContext(), tip, Toast.LENGTH_SHORT).show();
            }
        });

    }
}
