namespace Backend.Utils;

public static class Logger
{
    // global switch to enable or disable logging
    public static bool IsEnabled { get; set; } = false;

    // encapsulate Console.WriteLine
    public static void Log(string message)
    {
        if (IsEnabled)
        {
            Console.WriteLine(message);
        }
    }


    // error logging
    public static void Error(string message)
    {
        if (IsEnabled)
        {
            Console.Error.WriteLine(message);
        }
    }
}

