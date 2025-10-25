using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Backend.Models;

[Table("user")]
public class UserTable : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("avatar_url")]
    public string AvatarUrl { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("last_login")]
    public DateTime? LastLogin { get; set; }

    [Column("is_online")]
    public bool IsOnline { get; set; } = false;
}


[Table("chat_history")]
public class ChatHistoryTable : BaseModel
{

    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("time")]
    public DateTime Time { get; set; } = DateTime.UtcNow;

    [Column("is_send_out")]
    public bool IsSendOut { get; set; }

    [Column("message")]
    public string? Message { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; } // as foreign key
}
