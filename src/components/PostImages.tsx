interface IPostImagesProps {
  images: string[];
}

const PostImages = ({ images }: IPostImagesProps) => {
  if (!images || images.length === 0) return null;

  return (
    <div
      className={`post-image-container ${images.length === 1 ? "single" : "multiple"}`}
      data-testid={`post-image-container-${images.length}`}
    >
      {images.length === 1 && (
        <img
          src={images[0]}
          alt="Uploaded content"
          className="my-2 rounded-md max-w-full h-auto"
          data-testid="post-image-single"
        />
      )}

      {images.length === 2 && (
        <div className="flex justify-between my-2" data-testid="post-image-container-double">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Uploaded content ${idx}`}
              className="w-1/2 max-w-full h-auto object-cover mr-1"
              data-testid={`post-image-${idx}`}
            />
          ))}
        </div>
      )}

      {images.length === 3 && (
        <div className="flex my-2 rounded-md" data-testid="post-image-container-triple">
          <img
            src={images[0]}
            alt="Uploaded content 1"
            className="w-1/2 max-w-full h-auto mr-1 object-cover"
            data-testid="post-image-main"
          />
          <div className="w-1/2 flex flex-col">
            <img
              src={images[1]}
              alt="Uploaded content 2"
              className="max-w-full h-auto mb-2 object-cover"
              data-testid="post-image-secondary-1"
            />
            <img
              src={images[2]}
              alt="Uploaded content 3"
              className="max-w-full h-auto object-cover"
              data-testid="post-image-secondary-2"
            />
          </div>
        </div>
      )}

      {images.length >= 4 && (
        <div className="grid grid-cols-2 gap-2 my-2" data-testid="post-image-container-multiple">
          {images.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Uploaded content ${idx}`}
              className="rounded-md max-w-full h-auto"
              data-testid={`post-image-${idx}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostImages;
