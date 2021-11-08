use fastly::http::{header, Method, StatusCode};
use fastly::{mime, Error, Request, Response};
use rusttype::{Font, Scale};
use serde::Deserialize;
use percent_encoding::{percent_decode};

#[derive(Deserialize, Default)]
pub struct CardDetails {
    #[serde(default = "default_title")]
    pub title: String,
    #[serde(default)]
    pub huerot: i32,
}

fn default_title() -> String {
    "Edit the social card title".to_string()
}

#[fastly::main]
fn main(req: Request) -> Result<Response, Error> {
    // Filter request methods...
    match req.get_method() {
        // Allow GET and HEAD requests.
        &Method::GET | &Method::HEAD => match req.get_path() {
            "/card/" => {
                // Deserialize the query string parameters.
                let qs: CardDetails = req.get_query().unwrap();
                let title = percent_decode(&qs.title.as_bytes()).decode_utf8().unwrap();
                // Load and hue-rotate the card background.
                // Tip: Skipping hue rotation significantly reduces memory heap.
                let mut img = image::load_from_memory(include_bytes!("card-background.png"))?
                    .huerotate(qs.huerot);
                // Load font.
                let font = Font::try_from_vec(Vec::from(
                    include_bytes!("MochiyPopPOne-Regular.ttf") as &[u8],
                ))
                .unwrap();
                // Set font options.
                let height = 100.0;
                let mut scale_factor = 1.0;
                let max_word_length = (1200.0 / height * 1.5) as usize;
                // Set title if specified.
                if title.len() > 0 {
                    let longest_word_length = title
                        .split(" ")
                        .max_by_key(|word| word.len())
                        .unwrap()
                        .len();
                    // Font scaling is necessary because long words are not wrapped.
                    if longest_word_length > max_word_length {
                        scale_factor = (max_word_length as f32) / (longest_word_length as f32);
                    }
                    // Wrapping.
                    let mut i = 0;
                    textwrap::fill(
                        &title,
                        std::cmp::max(max_word_length, longest_word_length),
                    )
                    .split("\n")
                    .for_each(|line| {
                        // Create image composite.
                        imageproc::drawing::draw_text_mut(
                            &mut img,
                            image::Rgba([255u8, 255u8, 255u8, 255u8]),
                            60u32,
                            (40 + i * (height as u32) + 20) as u32,
                            Scale {
                                x: height * scale_factor,
                                y: height * scale_factor,
                            },
                            &font,
                            &line,
                        );
                        i = i + 1;
                    });
                }
                // Encode image as PNG and write bytes.
                let mut bytes: Vec<u8> = Vec::new();
                img.write_to(&mut bytes, image::ImageOutputFormat::Png)?;
                // Respond with image and long cache directives.
                Ok(Response::from_body(bytes)
                    .with_content_type(mime::IMAGE_PNG)
                    .with_header(header::CACHE_CONTROL, "public, max-age=31536000, immutable"))
            }
            // Catch all other requests and return 404.
            _ => Ok(Response::from_status(StatusCode::NOT_FOUND)),
        },
        // Deny anything else.
        _ => Ok(Response::from_status(StatusCode::METHOD_NOT_ALLOWED)),
    }
}
