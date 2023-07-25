export function New2DArray(j, k, fill){
    return Array(j)
        .fill(fill)
        .map(() => Array(k).fill(fill));
}

//only copy the reference and value of the list
export function Copy(originList){
    let new_array = []
    for (const item of originList) {
        new_array.push(item)
    }
    return new_array
}

export function Transpose(arr) {
    let newarr = []
    for (let i = 0; i < arr[0].length; i++) {
        newarr[i] = []
        for (let j = 0; j < arr.length; j++) {
            newarr[i][j] = arr[j][i]
        }
    }
    return newarr
}