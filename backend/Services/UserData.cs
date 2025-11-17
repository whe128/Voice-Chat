using Backend.Models;
using Backend.Utils;

namespace Backend.Services;

public class UserData
{
    //authenticate user by email and password
    public static async Task<(UserTable? user, string? error)> AuthenticateUserAsync(string email, string password)
    {
        // avoid empty inputs
        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            return (null, "Email or password is empty");

        var user = await GetUserByEmailAsync(email);
        if (user == null)
            return (null, "User not found, please register first");
        if (string.IsNullOrEmpty(user.PasswordHash))
            return (null, "unknow error occurred, please contact support");
        if (!PasswordHelper.VerifyPassword(password, user.PasswordHash))
            return (null, "password is incorrect");

        return (user, null);
    }

    public static async Task<UserTable> RegisterUserAsync(string email,
                                                        string password,
                                                        string provider,
                                                        string? avatarUrl
                                                        )
    {
        var existingUser = await GetUserByEmailAsync(email);
        if (existingUser != null)
        {
            throw new Exception("User with this email already exists.");
        }

        return await InsertUserAsync(email, password, provider, avatarUrl);
    }

    public static async Task UpdateLastLoginUserAsync(Guid userId)
    {
        var client = await DataService.GetClientAsync();
        var update = await client
                    .From<UserTable>()
                    .Where(u => u.Id == userId)
                    .Set(x => x.LastLogin!, DateTime.UtcNow)
                    .Update();
    }


    public static async Task UpdateIsOnlineUserAsync(Guid userId, bool isOnline)
    {
        var client = await DataService.GetClientAsync();
        var update = await client
                    .From<UserTable>()
                    .Where(u => u.Id == userId)
                    .Set(x => x.IsOnline!, isOnline)
                    .Update();
    }

    public static async Task UpdateAvatarUserAsync(Guid userId, string avatarUrl)
    {
        var client = await DataService.GetClientAsync();
        var update = await client
                    .From<UserTable>()
                    .Where(u => u.Id == userId)
                    .Set(x => x.AvatarUrl!, avatarUrl)
                    .Update();
    }


    public static async Task UpdateLanguageUserAsync(Guid userId, string language)
    {
        var client = await DataService.GetClientAsync();
        var update = await client
                    .From<UserTable>()
                    .Where(u => u.Id == userId)
                    .Set(x => x.Language!, language)
                    .Update();
    }

    public static async Task UpdateVoiceUserAsync(Guid userId, string voice)
    {
        var client = await DataService.GetClientAsync();
        var update = await client
                    .From<UserTable>()
                    .Where(u => u.Id == userId)
                    .Set(x => x.Voice!, voice)
                    .Update();
    }


    // get user by email
    public static async Task<UserTable?> GetUserByEmailAsync(string email)
    {
        var client = await DataService.GetClientAsync();
        var result = await client.From<UserTable>()
            .Where(u => u.Email == email)
            .Get();

        return result.Models.Count > 0 ? result.Models[0] : null;
    }

    // get user by uuid
    public static async Task<UserTable?> GetUserByidAsync(Guid id)
    {
        var client = await DataService.GetClientAsync();
        var result = await client.From<UserTable>()
            .Where(u => u.Id == id)
            .Get();

        return result.Models.Count > 0 ? result.Models[0] : null;
    }


    // insert a new user into the database
    public static async Task<UserTable> InsertUserAsync(string email, string password, string provider, string? avatarUrl)
    {
        try
        {
            var client = await DataService.GetClientAsync();
            var newUser = new UserTable
            {
                Email = email,
                PasswordHash = string.IsNullOrEmpty(password) ? "" : PasswordHelper.HashPassword(password),
                AvatarUrl = avatarUrl,
                Provider = provider
            };

            var result = await client.From<UserTable>().Insert(newUser);

            return result.Models[0];
        }
        catch
        {
            return null!;
        }
    }

    // delete a user by id
    public static async Task DeleteUserAsync(Guid userId)
    {
        var client = await DataService.GetClientAsync();

        await client
            .From<UserTable>()
            .Where(u => u.Id == userId)
            .Delete();
    }

    // update user
    public static async Task UpdateUserAsync(UserTable user)
    {
        var client = await DataService.GetClientAsync();
        var updateResult = await client
        .From<UserTable>()
        .Where(u => u.Id == user.Id)
        .Update(user);
    }

}
