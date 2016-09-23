


def large_contiguous_subsum(arr)
  i = 0
  j = 1
  largest = arr[i]
  result = 0

  until j == arr.length
    if (largest + arr[j]) > largest
      largest += arr[j]
      j += 1      
    else
      if (largest > result)
        result = largest
      end

      i = j + 1
      j = i + 1
      largest = 0
    end

  end
  result
end

# [3, -2, 4, 2, -2, 5, 2, 1, -2, 4]

# puts "hey"

p large_contiguous_subsum([3, -2, 4, 2, -2, 5, 2, 1, -2, 4])

