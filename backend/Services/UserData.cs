using Backend.Models;
using Backend.Util;

namespace Backend.Services;

public class UserData
{
    //authenticate user by email and password
    public static async Task<UserTable?> AuthenticateUserAsync(string email, string password)
    {
        var user = await GetUserByEmailAsync(email);
        if (user == null)
            return null; // user not found
        if (string.IsNullOrEmpty(user.PasswordHash))
            return null;
        if (!PasswordHelper.VerifyPassword(password, user.PasswordHash))
            return null; // password incorrect

        user.LastLogin = DateTime.UtcNow;
        user.IsOnline = true;

        await UpdateUserAsync(user);

        return user;
    }

    public static async Task<UserTable> RegisterUserAsync(string email, string password, string? avatarUrl = "")
    {
        var existingUser = await GetUserByEmailAsync(email);
        if (existingUser != null)
        {
            throw new Exception("User with this email already exists.");
        }

        return await InsertUserAsync(email, password, avatarUrl);
    }


    public static async Task LogoutUserAsync(Guid userId)
    {
        var client = await DataService.GetClientAsync();
        var update = await client
                    .From<UserTable>()
                    .Where(u => u.Id == userId)
                    .Set(x => x.IsOnline!, false)
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

    // get user by email
    public static async Task<UserTable?> GetUserByUuidAsync(Guid uuid)
    {
        var client = await DataService.GetClientAsync();
        var result = await client.From<UserTable>()
            .Where(u => u.Id == uuid)
            .Get();

        return result.Models.Count > 0 ? result.Models[0] : null;
    }


    // insert a new user into the database
    public static async Task<UserTable> InsertUserAsync(string email, string password, string? avatarUrl = "")
    {
        try
        {
            var client = await DataService.GetClientAsync();
            var newUser = new UserTable
            {
                Email = email,
                PasswordHash = PasswordHelper.HashPassword(password),
                AvatarUrl = avatarUrl ?? string.Empty,
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
