# 列表工具模块
from typing import List, Any

def flatten(nested_list):
    """展平嵌套列表"""
    result = []
    for item in nested_list:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

def unique(lst):
    """去重保持顺序"""
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

def chunk(lst, size):
    """将列表分割成指定大小的块"""
    return [lst[i:i + size] for i in range(0, len(lst), size)]

def shuffle(lst):
    """随机打乱列表"""
    import random
    result = lst.copy()
    random.shuffle(result)
    return result

def find_duplicates(lst):
    """找出重复元素"""
    seen = set()
    duplicates = set()
    for item in lst:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    return list(duplicates)
