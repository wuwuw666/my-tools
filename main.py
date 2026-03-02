# 主程序入口
from utils import (
    greet, fibonacci, factorial,
    generate_password, is_palindrome,
    flatten, unique
)

def main():
    print("=" * 50)
    print("🛠️  My Tools - Python 工具集合")
    print("=" * 50)

    # 问候
    greet("Developer")
    print()

    # 数学工具演示
    print("📊 数学工具:")
    print(f"   斐波那契(10): {fibonacci(10)}")
    print(f"   阶乘(5): {factorial(5)}")
    print()

    # 字符串工具演示
    print("🔐 字符串工具:")
    print(f"   随机密码: {generate_password(16)}")
    print(f"   'radar' 是回文: {is_palindrome('radar')}")
    print()

    # 列表工具演示
    print("📋 列表工具:")
    nested = [1, [2, 3], [4, [5, 6]]]
    print(f"   展平 {nested}: {flatten(nested)}")
    print(f"   去重 [1,2,2,3,3,3]: {unique([1,2,2,3,3,3])}")
    print()

    print("=" * 50)
    print("✨ 演示完成!")

if __name__ == "__main__":
    main()
