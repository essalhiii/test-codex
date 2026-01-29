export type UploadTarget = {
  fileName: string;
  buffer: Buffer;
};

export async function uploadFile({ fileName }: UploadTarget) {
  return {
    url: `/uploads/${fileName}`,
    fileName
  };
}
