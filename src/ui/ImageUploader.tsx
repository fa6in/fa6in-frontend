


import type{ IconType } from "react-icons";
import type { ReactNode } from "react";
import { FiUpload } from "react-icons/fi";
import ImageUploading, { type ImageListType } from "react-images-uploading";

type Props = {
  Icon?: IconType;
  className?: string;
  profile?: string;
  placeholder?: string | ReactNode;
  image: ImageListType;
  setImage: (value: ImageListType) => void;
};

function ImageUploader({
  Icon,
  className,
  placeholder = "Jpeg or Png",
  image,
  setImage,
}: Props) {

  const onChange = (imageList: ImageListType) => {
    setImage(imageList);
  };
  return (
    <>
      <ImageUploading
  value={image}
  maxNumber={1}
  onChange={onChange}
  dataURLKey="data_url"
>
  {({ imageList, onImageUpload, onImageUpdate }) => (
    <div
      className={`${className} flex h-[129px] w-[140px] items-center justify-center rounded-lg ${
        image?.length === 0 && "border-2 border-dashed"
      }`}
    >
      {imageList.length > 0 ? (
        <img
          onClick={() => onImageUpdate(0)}
          src={imageList[0]["data_url"]}
          alt=""
          className="h-full w-full cursor-pointer object-cover rounded-lg"
        />
      ) : (
        <div
          onClick={onImageUpload}
          className="cursor-pointer space-y-2 p-8 text-center"
        >
          {Icon ? (
            <div className="flex items-center justify-center">
              <Icon />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <FiUpload className="w-4 h-4 mb-2" />
              <p className="text-[12.5px] text-black">{placeholder}</p>
              <span className="text-xs">Jpeg or Png</span>
            </div>
          )}
        </div>
      )}
    </div>
  )}
</ImageUploading>

    </>
  );
}

export default ImageUploader;