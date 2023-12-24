import BlogCard from "@/components/BlogCard";
import Disqus from "@/components/Disqus";
import Share from "@/components/Share";
import config from "@/config/config.json";
import ImageFallback from "@/helpers/ImageFallback";
import MDXContent from "@/helpers/MDXContent";
import { getSinglePage } from "@/lib/contentParser";
import dateFormat from "@/lib/utils/dateFormat";
import similerItems from "@/lib/utils/similarItems";
import { humanize, markdownify, slugify } from "@/lib/utils/textConverter";
import SeoMeta from "@/partials/SeoMeta";
import { Post } from "@/types";
import Link from "next/link";
import {
  FaRegClock,
  FaRegFolder,
  FaRegUserCircle,
} from "react-icons/fa/index.js";
import { getSinglePost, getAuthorById } from "@/lib/actions";
import { fetchPageBySlug, fetchPageBlocks, notion } from "@/lib/notion";
import bookmarkPlugin from "@notion-render/bookmark-plugin";
import { NotionRenderer } from "@notion-render/client";
import hljsPlugin from "@notion-render/hljs-plugin";
import { notFound } from "next/navigation";
import { HighlightOptions } from "highlight.js";

const { blog_folder } = config.settings;

// remove dynamicParams
export const dynamicParams = false;

// generate static params
export const generateStaticParams: () => { single: string }[] = () => {
  const posts: Post[] = getSinglePage(blog_folder);

  const paths = posts.map((post) => ({
    single: post.slug!,
  }));

  return paths;
};

const page = async ({ params }: { params: { slug: string } }) => {
  const post = await fetchPageBySlug(params.slug);
  console.log(params)
  if (!post) notFound();

  const blocks = await fetchPageBlocks(post.id);

  const renderer = new NotionRenderer({
    client: notion,
  });

  const highlightOptions: HighlightOptions = {
    language: 'typescript',
    ignoreIllegals: true,  // Ini opsional, sesuai dengan definisi antarmuka
  };
  renderer.use(hljsPlugin(highlightOptions));
  renderer.use(bookmarkPlugin(undefined));
  const html = await renderer.render(...blocks);

  const { title, summary, category, tags, created_at, author } =
    post.properties;
  const cover_url = post.cover?.external?.url || post.cover?.file?.url;
  const getTitle = title.title.map((title) => {
    return title.plain_text;
  });

  const newAuthor = author.people[0];

  return (
    <>
      {/*<SeoMeta
        title={getTitle[0]}
        meta_title={getTitle[0]}
        description={summary}
        image={cover_url}
      />*/}
      <section className="section pt-7">
        <div className="container">
          <div className="row justify-center">
            <article className="lg:col-10">
              {cover_url && (
                <div className="mb-10">
                  <ImageFallback
                    src={cover_url}
                    height={500}
                    width={1200}
                    alt={getTitle[0]}
                    className="w-full rounded"
                  />
                </div>
              )}
              <h1
                dangerouslySetInnerHTML={markdownify(getTitle[0])}
                className="h2 mb-4"
              />
              <ul className="mb-4">
                <li className="mr-4 inline-block">
                  <a href={`/authors/${slugify(post.created_by.id)}`}>
                    <FaRegUserCircle className={"-mt-1 mr-2 inline-block"} />
                    {newAuthor?.name
                      ? `${humanize(newAuthor?.name)}`
                      : "Author"}
                  </a>
                </li>
                <li className="mr-4 inline-block">
                  <FaRegFolder className={"-mt-1 mr-2 inline-block"} />
                  {category?.multi_select.length > 0
                    ? category?.multi_select?.map(
                        (category: string, index: number) => (
                          <Link
                            key={category.id}
                            href={`/categories/${slugify(category.id)}`}
                          >
                            {humanize(category.name)}
                            {index !== category.length - 1 && ", "}
                          </Link>
                        ),
                      )
                    : "category"}
                </li>
                {created_at.created_time && (
                  <li className="mr-4 inline-block">
                    <FaRegClock className="-mt-1 mr-2 inline-block" />
                    {dateFormat(created_at.created_time)}
                  </li>
                )}
              </ul>
              <div className="content mb-10">
                <div dangerouslySetInnerHTML={{ __html: html }}></div>;
                {/*<MDXContent content={content_text} />*/}
              </div>
              <div className="row items-start justify-between">
                <div className="mb-10 flex items-center lg:col-5 lg:mb-0">
                  <h5 className="mr-3">Tags:</h5>
                  <ul>
                    {tags?.multi_select?.map((tag: string) => (
                      <li key={tag.id} className="inline-block">
                        <Link
                          className="m-1 block rounded bg-theme-light px-3 py-1 hover:bg-primary hover:text-white dark:bg-darkmode-theme-light dark:hover:bg-darkmode-primary dark:hover:text-dark"
                          href={`/tags/${slugify(tag.id)}`}
                        >
                          {humanize(tag.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center lg:col-4">
                  <h5 className="mr-3">Share :</h5>
                  <Share
                    className="social-icons"
                    title={title}
                    description={summary}
                    slug={params.single}
                  />
                </div>
              </div>
              <Disqus className="mt-20" />
            </article>
          </div>

          {/* <!-- Related posts --> */}
          {/*<div className="section pb-0">
            <h2 className="h3 mb-12 text-center">Related Posts</h2>
            <div className="row justify-center">
              {similarPosts.map((post) => (
                <div key={post.slug} className="lg:col-4 mb-7">
                  <BlogCard data={post} />
                </div>
              ))}
            </div>
          </div>*/}
        </div>
      </section>
    </>
  );
};

export default page;
