# 字符串工具模块
import random
import string

def reverse_string(s):
    """反转字符串"""
    return s[::-1]

def count_chars(s):
    """统计字符数"""
    return {
        "total": len(s),
        "letters": sum(c.isalpha() for c in s),
        "digits": sum(c.isdigit() for c in s),
        "spaces": sum(c.isspace() for c in s)
    }

def generate_password(length=12):
    """生成随机密码"""
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(chars) for _ in range(length))

def is_palindrome(s):
    """检查是否为回文"""
    s = s.lower().replace(" ", "")
    return s == s[::-1]

def truncate(s, length=50, suffix="..."):
    """截断字符串"""
    if len(s) <= length:
        return s
    return s[:length] + suffix
