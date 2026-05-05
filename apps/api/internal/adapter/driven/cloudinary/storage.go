package cloudinary

import (
	"context"
	"io"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

type Storage struct {
	client *cloudinary.Cloudinary
	log    *logger.Logger
}

func NewStorage(cloudinaryURL string, log *logger.Logger) (*Storage, error) {
	l := log.WithComponent("cloudinary")

	cld, err := cloudinary.NewFromURL(cloudinaryURL)
	if err != nil {
		l.Error().Err(err).Msg("failed to initialize Cloudinary")
		return nil, err
	}

	l.Info().Msg("Cloudinary storage initialized")

	return &Storage{
		client: cld,
		log:    l,
	}, nil
}

func (s *Storage) Upload(ctx context.Context, file io.Reader, filename string, folder string) (string, error) {
	result, err := s.client.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID: filename,
		Folder:   "neurodyne/" + folder,
	})
	if err != nil {
		s.log.Error().Err(err).Str("filename", filename).Msg("upload failed")
		return "", err
	}

	s.log.Debug().Str("public_id", result.PublicID).Msg("file uploaded")
	return result.SecureURL, nil
}

func (s *Storage) Delete(ctx context.Context, publicID string) error {
	_, err := s.client.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	return err
}

func (s *Storage) GetURL(publicID string) string {
	asset, _ := s.client.Image(publicID)
	if asset == nil {
		return ""
	}
	url, _ := asset.String()
	return url
}

var _ port.FileStorage = (*Storage)(nil)
