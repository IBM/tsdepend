export async function asyncForEach<T>(
  array: T[],
  callback: (e: T, index: number, array: T[]) => void
): Promise<void> {
  for (let index: number = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
